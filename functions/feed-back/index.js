// 反馈

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command

const collection = "feed-back"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    app.router("add", async(ctx, next)=>{
        try {
            await db.collection(collection).add({
                content: event.content,
                images: event.images,
            })

            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    })


    return app.serve()

};
