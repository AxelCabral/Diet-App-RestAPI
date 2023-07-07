import { FastifyReply, FastifyRequest } from "fastify"

export async function checkSessionUserIdExists(request: FastifyRequest, reply: FastifyReply){
    const sessionUserId = request.cookies.sessionUserId

    if(!sessionUserId){
        return reply.status(401).send({
            error: 'Unauthorized'
        })
    }
}