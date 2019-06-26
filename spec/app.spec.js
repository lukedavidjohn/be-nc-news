process.env.NODE_ENV = 'test'
const { app } = require("../app");
const { expect } = require("chai");
const request = require("supertest")(app);
const { connection } = require("../db/connection");

describe('/api', () => {
    beforeEach(() => {
        return connection.seed.run();
    })
    after(() => {
        connection.destroy();
    })
    describe('/topics', () => {
        it('GET - returns status 200', () => {
            return request.get('/api/topics').expect(200);
        })
        it('GET - returns an array of topic-objects with correct keys', () => {
            return request.get('/api/topics').then(({body}) => {
                expect(body.topics).to.be.an('array');
                expect(body.topics.length).to.be.greaterThan(0);
                expect(body.topics[0]).to.contain.keys('slug', 'description');
            })
        })
    })
    describe('/users', () => {
        it('GET by username - returns status 200', () => {
            return request.get('/api/users/lurker')
                .expect(200);
        })
        it('GET by username - returns an array of user-objects with correct keys', () => {
            return request.get('/api/users/lurker')
                .then(({body}) => {
                expect(body).to.be.an('object');
                expect(body).to.contain.keys('username', 'avatar_url', 'name');
                expect(body.username).to.equal('lurker')
            })
        })
        it('GET by username - returns status 404 if passed invalid username', () => {
            return request.get('/api/users/smirker')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).to.equal('username not found')
            })
        })
    })
    describe('/articles', () => {
        it('GET by article_id - returns status 200', () => {
            return request
                .get('/api/articles/1')
                .expect(200);
        })
        it('GET by article_id - returns an array of article-objects with correct keys, with added comment count column', () => {
            return request
                .get('/api/articles/1')
                .then(({body}) => {
                    expect(body).to.be.an('object');
                    expect(body).to.contain.keys('title', 'body', 'votes'
                    , 'comment_count'
                    );
                    expect(body.title).to.equal('Living in the shadow of a great man')
                    expect(body.comment_count).to.equal('13')
                })
        })
        it('GET by article_id - returns status 404 if passed invalid article_id', () => {
            return request
                .get('/api/articles/999999')
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).to.equal('username not found')
                })
        })
        it('PATCH by article_id - returns status 200', () => {
            return request
                .patch('/api/articles/1')
                .send({votes: 1})
                .expect(200)
        })
        it('PATCH by article_id - updates value accordingly', () => {
            return request
                .patch('/api/articles/1')
                .send({votes: 1})
                .then(({body}) => {
                    expect(body.votes).to.equal(101)
                })
        })
        it('PATCH by article_id - returns status 404 if passed invalid article_id', () => {
            return request
                .patch('/api/articles/999999')
                .send({votes: 1})
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).to.equal('username not found')
                })
        })
    })
    // describe('/comments', () => {
    //     it('POST by article_id - returns status 200', () => {
    //         return request
    //             .post('/api/articles/1')
    //             .send({
    //                 author: 'butter_bridge',
    //                 article_id: 1,
    //                 votes: 1000000,
    //                 body: 'here is some text, here is some text'
    //             })
    //             .expect(200)

    //     })
    // })
})