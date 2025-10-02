// im way too tired to add tons of comments for everything that happens i believe in your ability to read simple code dude

async function core(u){
  if(!u) return {error:"no url"}
  if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(u)) u="http://"+u
  let final=u,hops=[],status=null
  for(let i=0;i<10;i++){
    let r=await fetch(final,{method:"HEAD",redirect:"manual"}).catch(()=>null)
    if(!r) break
    status=r.status
    if(r.status>=300&&r.status<400){
      let loc=r.headers.get("location"); if(!loc) break
      final=new URL(loc,final).toString()
      hops.push(final)
    } else break
  }
  return {input:u,final,hops,hops_count:hops.length,status}
}

// vercel
export default async (req,res)=>{
  let url=(req.query&&req.query.url)||(req.body&&req.body.url)
  let out=await core(url)
  if(res){res.setHeader("Content-Type","application/json");res.status(out.error?400:200).json(out)}
  else return out
}

// netlify
exports.handler=async (event)=>{
  let url=event.queryStringParameters&&event.queryStringParameters.url
  let out=await core(url)
  return {statusCode:out.error?400:200,body:JSON.stringify(out),headers:{"Content-Type":"application/json"}}
}

// aws lambda
exports.lambdaHandler=async (event)=>{
  let url=event.queryStringParameters&&event.queryStringParameters.url
  let out=await core(url)
  return {statusCode:out.error?400:200,body:JSON.stringify(out),headers:{"Content-Type":"application/json"}}
}

// cloudflare workers
export async function fetch(req){
  let u=new URL(req.url).searchParams.get("url")
  let out=await core(u)
  return new Response(JSON.stringify(out),{status:out.error?400:200,headers:{"content-type":"application/json"}})
}
