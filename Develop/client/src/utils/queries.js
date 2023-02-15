import { gql } from "@apollo/client";

export const GET_ME = gql`
    query getMe($_id: ID!, $username: String!){
        me(_id: $_id, username: $username) {
            _id
            username
            email
            bookCount
            savedBooks
        }
    }
`;