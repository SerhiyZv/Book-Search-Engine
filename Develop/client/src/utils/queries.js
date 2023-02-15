import { gql } from "@apollo/client";

export const GET_ME = gql`
    query me {
        me {
            username
            bookCount
            savedBooks {
                bookId
                authors
                title
                description
                image
            }
        }
    }
`;