import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { knex } from '../database';
import { checkSessionUserIdExists } from '../middlewares/check-session-user-id-exists';

export async function mealRoutes(app: FastifyInstance) {
    
    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method}] ${request.url}`)
    })
    
    app.get('/', 
    { 
        preHandler: [checkSessionUserIdExists],
    }, 
    async (request, reply) => {
       
        const { sessionUserId } = request.cookies

        const meals = await knex('meals')
        .where('user_id', sessionUserId)
        .select()

        return {
            meals
        }
    })
    
    app.get('/metrics',
    { 
        preHandler: [checkSessionUserIdExists],
    },
    async (request, reply) =>{
        
        const { sessionUserId } = request.cookies

        const meals = await knex('meals')
        .where('user_id', sessionUserId)
        .orderBy('created_at')

        const totalMealsCount = await knex('meals')
        .where('user_id', sessionUserId)
        .count({count: '*'})

        const inDietMealsCount = await knex('meals')
        .where({
            'user_id': sessionUserId,
            'in_or_out_diet': true
        })
        .count({count: '*'})
        
        const outDietMealsCount = await knex('meals')
        .where({
            'user_id': sessionUserId,
            'in_or_out_diet': false
        })
        .count({count: '*'})

        let sequel = 0
        let bestInDietSequel = 0

        meals.forEach((meal) =>{
            if(meal.in_or_out_diet === 1){
                sequel++
            }
            else{
                sequel = 0
            }
            
            if(sequel > bestInDietSequel){
                bestInDietSequel = sequel
            }
        })

        const totalMeals = totalMealsCount[0].count
        const inDietMeals = inDietMealsCount[0].count
        const outDietMeals = outDietMealsCount[0].count

        const metrics = {
            totalMeals,
            inDietMeals,
            outDietMeals,
            bestInDietSequel
        }

        return {
            metrics
        }
    })

    app.put('/:id', 
    { 
        preHandler: [checkSessionUserIdExists],
    },
    async (request, reply) => {
        const getMealParamSchema = z.object({
            id: z.string().uuid(),
        })

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_or_out_diet: z.boolean(),
        })

        const { id } = getMealParamSchema.parse(request.params)
        const { name, description, in_or_out_diet } = createMealBodySchema.parse(request.body)

        const { sessionUserId } = request.cookies

        const meal = await knex('meals')
        .where({
            user_id: sessionUserId,
            id,
        })
        .select()

        if(meal.length > 0){
            
            await knex('meals')
            .where({
                user_id: sessionUserId,
                id
            })
            .update({
                name,
                description,
                in_or_out_diet
            })

            return reply.status(204).send()
            
        }
        return reply.status(404).send()
    })

    app.get('/:id', 
    { 
        preHandler: [checkSessionUserIdExists],
    }, 
    async (request, reply) => {
        const getMealParamSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getMealParamSchema.parse(request.params)

        const { sessionUserId } = request.cookies

        const meal = await knex('meals')
        .where({
            user_id: sessionUserId,
            id, 
        })
        .first()

        return {
            meal
        }
    })
   
    app.post('/',
    { 
        preHandler: [checkSessionUserIdExists],
    }, 
    async (request, reply) => {
       // { id, name, user_id, description, in_or_out_diet }
       
       const { sessionUserId } = request.cookies
       
       const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_or_out_diet: z.boolean(),
        })
      
        const { name, description, in_or_out_diet } = createMealBodySchema.parse(request.body)

        await knex('meals').insert({
            id: randomUUID(),
            name,
            user_id: sessionUserId,
            description,
            in_or_out_diet
        })

         return reply.status(201).send()
      })

    app.delete('/:id',
    { 
        preHandler: [checkSessionUserIdExists],
    }, 
    async (request, reply) => {
       // { id, name, user_id, description, in_or_out_diet }

       const getMealParamSchema = z.object({
            id: z.string().uuid(),
        })

       const { id } = getMealParamSchema.parse(request.params)
       
       const { sessionUserId } = request.cookies

        const meals = await knex('meals')
        .where({
            user_id: sessionUserId,
            id
        })
        .select()
        
        if(meals.length > 0){

            await knex('meals')
            .where({
                user_id: sessionUserId,
                id
            })
            .del()

            return reply.status(202).send()
        }

        return reply.status(404).send()
      })
}