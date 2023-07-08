import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { knex } from '../database';

export async function userRoutes(app: FastifyInstance) {

    app.get('/',
    async (request, reply) => {

        const users = await knex('users')
        .select()

        return {
            users
        }
    })
    
    app.get('/:id',
    async (request) => {
        const getUserParamSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getUserParamSchema.parse(request.params)

        const user = await knex('users')
        .where({
            id, 
        })
        .first()

        return {
            user
        }
    })
    
    app.post('/', async (request, reply) => {
       // { id, name, profile_picture_url }
       
       const createUserBodySchema = z.object({
            name: z.string(),
            profilePictureUrl: z.string()
        })
      
        const { name, profilePictureUrl } = createUserBodySchema.parse(request.body)

        const userId = randomUUID()

        await knex('users').insert({
            id: userId,
            name,
            profile_picture_url: profilePictureUrl
        })

        const sessionUserId = request.cookies.sessionUserId

        if(!sessionUserId){
            reply.cookie('sessionUserId', userId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
        }

         return reply.status(201).send()
      })
}