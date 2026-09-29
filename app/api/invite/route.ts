import {authorized,json} from "../../../lib/supabase";
export async function POST(request:Request){
  const user=await authorized(request);if(!user||user.role!=="owner")return json({error:"Owner access required"},403);
  const {email}=await request.json().catch(()=>({}));const address=String(email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)||address.length>254)return json({error:"Enter a valid email"},400);
  const {error}=await user.client.from("sd_members").insert({email:address,role:"member"});
  return error?json({error:error.message},400):json({ok:true});
}
