import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

// it.only - Roda o somente o teste especificado
// it.todo - Lembra de um teste que ainda precisa ser feito
// it.skip - Não roda o teste especificado

describe('Meals Routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new meal', async () => {
        
        const createUserResponse = await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const cookies = createUserResponse.get('Set-cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da manhã',
	        description: 'Biscoitos recheados, Bolo, Café com leite',
	        inOrOutDiet: false
        })
        .expect(201)
    })
    
    it('should be able to list all meals', async () => {
        
        const createUserResponse = await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const cookies = createUserResponse.get('Set-cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da manhã',
	        description: 'Biscoitos recheados, Bolo, Café com leite',
	        inOrOutDiet: false
        })

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        expect(listMealsResponse.body.meals).toEqual([
            expect.objectContaining({
                name: 'Café da manhã',
                description: 'Biscoitos recheados, Bolo, Café com leite',
                in_or_out_diet: 0
            })
        ])
    })

    it('should be able to get a specific meal', async () => {
        
        const createUserResponse = await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const cookies = createUserResponse.get('Set-cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da manhã',
	        description: 'Biscoitos recheados, Bolo, Café com leite',
	        inOrOutDiet: false
        })

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        expect(listMealsResponse.body.meals).toEqual([
            expect.objectContaining({
                name: 'Café da manhã',
                description: 'Biscoitos recheados, Bolo, Café com leite',
                in_or_out_diet: 0
            })
        ])

        const mealId = listMealsResponse.body.meals[0].id

        const getMealsResponse = await request(app.server)
        .get(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .expect(200)

        expect(getMealsResponse.body.meal).toEqual(
            expect.objectContaining({
                id: mealId,
                name: 'Café da manhã',
                description: 'Biscoitos recheados, Bolo, Café com leite',
                in_or_out_diet: 0
            })
        )
    })

    it('should be able to delete a meal', async () => {
        
        const createUserResponse = await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const cookies = createUserResponse.get('Set-cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da manhã',
	        description: 'Biscoitos recheados, Bolo, Café com leite',
	        inOrOutDiet: false
        })

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        const mealId = listMealsResponse.body.meals[0].id

        await request(app.server)
        .delete(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .send({
            id: mealId
        })
        .expect(202)

        await request(app.server)
        .get(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .expect(404)
        
    })

    it('should be able to update data of a meal', async () => {
        
        const createUserResponse = await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const cookies = createUserResponse.get('Set-cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da manhã',
	        description: 'Biscoitos recheados, Bolo, Café com leite',
	        inOrOutDiet: false
        })

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        const mealId = listMealsResponse.body.meals[0].id

        await request(app.server)
        .put(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .send({
            name: 'Almoço',
	        description: 'Filé com fritas',
	        inOrOutDiet: true
        })
        .expect(204)

        const mealUpdated = await request(app.server)
        .get(`/meals/${mealId}`)
        .set('Cookie', cookies)
    
        expect(mealUpdated.body.meal).toEqual(
            expect.objectContaining({
                id: mealId,
                name: 'Almoço',
                description: 'Filé com fritas',
                in_or_out_diet: 1
            })
        )
    })

    it('should be able to get metrics of user meals', async () => {

        const createUserResponse = await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const cookies = createUserResponse.get('Set-cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da manhã',
	        description: 'Biscoitos recheados, Bolo, Café com leite',
	        inOrOutDiet: true
        })

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Almoço',
	        description: 'Arroz, Feijão, Legumes e Banana',
	        inOrOutDiet: true
        })

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Café da tarde',
	        description: 'Salada de fruta, vitamina',
	        inOrOutDiet: true
        })

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Jantar',
	        description: 'Pizza',
	        inOrOutDiet: false
        })

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Sobremesa',
	        description: 'Pizza doce',
	        inOrOutDiet: false
        })

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'Cadé da manhã',
	        description: 'Leite, Pão com patê, maçã',
	        inOrOutDiet: true
        })

        const userMetrics = await request(app.server)
        .get('/meals/metrics')
        .set('Cookie', cookies)
        .expect(200)

        expect(userMetrics.body.metrics).toEqual(
            expect.objectContaining({
                totalMeals: 6,
                inDietMeals: 4,
                outDietMeals: 2,
                bestInDietSequel: 3
            })
        )
    })
})