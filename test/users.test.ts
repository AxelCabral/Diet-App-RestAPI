import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

// it.only - Roda o somente o teste especificado
// it.todo - Lembra de um teste que ainda precisa ser feito
// it.skip - Não roda o teste especificado

describe('Users Routes', () => {
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

    it('should be able to create a new user', async () => {
    
        // Testando com retorno direto
        await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })
        .expect(201)
    })

    it('should be able to list all users', async () => {
        await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const listUsersResponse = await request(app.server)
        .get('/users')
        .expect(200)

        expect(listUsersResponse.body.users).toEqual([
            expect.objectContaining({
                name: 'Aspher',
	            profile_picture_url: 'asas.png'
            })
        ])
    })

    it('should be able to get a specific user', async () => {
        await request(app.server)
        .post('/users')
        .send({
            name: 'Aspher',
	        profilePictureUrl: 'asas.png'
        })

        const listUsersResponse = await request(app.server)
        .get('/users')
        .expect(200)

        expect(listUsersResponse.body.users).toEqual([
            expect.objectContaining({
                name: 'Aspher',
	            profile_picture_url: 'asas.png'
            })
        ])

        const userId = listUsersResponse.body.users[0].id

        const getUsersResponse = await request(app.server)
        .get(`/users/${userId}`)
        .expect(200)

        expect(getUsersResponse.body.user).toEqual(
            expect.objectContaining({
                id: userId,
                name: 'Aspher',
	            profile_picture_url: 'asas.png'
            })
        )
    })
})