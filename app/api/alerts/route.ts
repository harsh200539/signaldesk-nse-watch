import {authorized,json} from "../../../lib/supabase";
export async function POST(request:Request){
  const user=await authorized(request);if(!user)return json({error:"Sign in required"},401);
  const {id}=await request.json().catch(()=>({}));if(typeof id!=="string")return json({error:"Missing filing"},400);
  const {error}=await user.client.from("sd_reads").upsert({email:user.email,filing_id:id,read_at:new Date().toISOString()});
  return error?json({error:error.message},400):json({ok:true});
}
