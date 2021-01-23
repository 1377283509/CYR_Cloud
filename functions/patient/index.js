// 患者
const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command

// 患者 集合名
const patientsCollection = "patients"


exports.main = async function (event) {

    const app = new TcbRouter({ event })
    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 搜索
    app.router("search", async(ctx, next)=>{
        try {
            const res = await db.collection(patientsCollection).where({
                name: db.RegExp({
                    regexp: event.name,
                    options: 'i',
                })
            }).field({
                name: true,
                age: true,
                gender: true,
                address: true,
                idCard: true
            }).get()
            ctx.body = {
                data: res.data,
                code: 1
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    })

    // 新建患者
    app.router("createPatient", 
    // 检查是否存在
    async(ctx,next)=>{
        try {
            const res = await db.collection(patientsCollection).where({
                idCard: event.idCard
            }).field({
                _id: true
            }).get()
            if(res.data.length == 0){
                // 等于0，不存在，创建
                await next()
            }else{
                ctx.body = {
                    code: 1,
                    data: res.data[0]._id
                }
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    }, 
    // 创建
    async(ctx, next)=>{
        try {
            const res = await db.collection(patientsCollection).add({
                name: event.name,
                gender: event.gender,
                age: event.age,
                idCard: event.idCard,
                address: event.address
            })
            ctx.body = {
                code: 1,
                data: res.id
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                data: "数据库异常",
                code: 0
            }
        }

    })

    // 通过ID搜索
    app.router("searchById", async(ctx, next)=>{
        try {
            const res = await db.collection(doctorCollection).where({
                _id: event.id
            }).get()
            ctx.body = {
                code: 1,
                data: res.data.length>0?res.data[0]:"不存在"
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
