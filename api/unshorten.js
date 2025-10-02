// just upload this to vercel or netlify or sm shit you can even print out the code on paper and wipe your ass on i dont care this isnt anything new im not reinventing the wheel
export default async (req, res) => {
  let u = req.query.url || (req.body && req.body.url)
  if (!u) return res.status(400).json({error:"no url"})
  if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(u)) u="http://"+u
  let final=u, hops=[], status=null
  try {
    for (let i=0;i<10;i++){
      let r=await fetch(final,{method:"HEAD",redirect:"manual"})
      status=r.status
      if(r.status>=300 && r.status<400){
        let loc=r.headers.get("location")
        if(!loc) break
        let next=new URL(loc,final).toString()
        hops.push(next); final=next
      } else break
    }
    res.setHeader("Content-Type","application/json")
    res.json({input:u,final,hops,hops_count:hops.length,status})
  } catch(e){
    res.status(500).json({error:String(e)})
  }
}
