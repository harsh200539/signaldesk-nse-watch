import {authorized,json} from "../../../lib/supabase";
export async function POST(request:Request){
  const user=await authorized(request);if(!user)return json({error:"Sign in required"},401);
  const token=request.headers.get("Authorization")?.replace(/^Bearer /,"")||"";
  const {id}=await request.json().catch(()=>({}));if(typeof id!=="string"||id.length>1000)return json({error:"Invalid filing"},400);
  const response=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sd-monitor`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`,apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!},body:JSON.stringify({id}),signal:AbortSignal.timeout(30000)});
  const body=await response.json().catch(()=>({error:"Analysis service unavailable"}));
  return json(body,response.status);
}
