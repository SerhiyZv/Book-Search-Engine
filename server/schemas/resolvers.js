const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth.js');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (!context.user)
                throw new AuthenticationError('You need to be logged in to view saved books');

            return await User.findOne({ _id: context.user._id }).populate(
                'savedBooks'
            );
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email: email });

            if (!user) throw new AuthenticationError("Can't find this user");

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) throw new AuthenticationError('Wrong password!');

            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username: username, email: email, password: password });

            if (!user) return 'Something is wrong!';

            const token = signToken(user);

            return ({ token, user });
        },
        saveBook: async (parent, { book }, context) => {
            if (!context.user) throw new AuthenticationError('You need to log in');

            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true }
                );
                
                return updatedUser;
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        removeBook: async (parent, { bookId }, context) => {
            if (!context.user) throw new AuthenticationError('You need to log in');

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            );

            if (!updatedUser) return "Couldn't find user with this id!";

            return updatedUser;
        }
    }
};

module.exports = resolvers;