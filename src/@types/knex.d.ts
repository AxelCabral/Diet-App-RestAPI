// eslint-disable-next-line

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string
            name: string
            profile_picture: string
            created_at: string
        }

        meals: {
            id: string
            name: string
            user_id: string
            description: string
            in_or_out_diet: boolean
            created_at: string
        }
    }
}