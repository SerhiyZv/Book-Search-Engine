const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, { user }) => {
            const foundUser = await User.findOne({
                $or: [{ _id: user._id }, { username: user.username }],
            });

            if (!foundUser) {
                return 'Cannot find a user with this id!';
            }

            return foundUser;
        }
    },
    Mutation: {
        login: async (parent, { username, email, password }) => {
            const user = await User.findOne({ $or: [{ username: username }, { email: email }] });

            if (!user) return "Can't find this user";

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) return 'Wrong password!';

            const token = signToken(user);
            return ({ token, user });
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username: username, email: email, password: password });

            if (!user) return 'Something is wrong!';

            const token = signToken(user);

            return ({ token, user });
        },
        saveBook: async (parent, { saveBook }, context) => {
            if (!context.user) throw new AuthenticationError('You need to log in');

            try {
                const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: saveBook } },
                { new: true, runValidators: true }
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