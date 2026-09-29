import {authorized,json} from "../../../lib/supabase";
export async function PATCH(request:Request){
  const user=await authorized(request);if(!user)return json({error:"Sign in required"},401);
  const body=await request.json().catch(()=>({}));
  const chat=String(body.telegram_chat_id||"").trim();
  if(chat&&!/^-?\d{4,20}$/.test(chat))return json({error:"Enter a numeric Telegram chat ID"},400);
  const {error}=await user.client.from("sd_members").update({telegram_chat_id:chat||null,telegram_alerts:!!body.telegram_alerts,email_alerts:!!body.email_alerts}).eq("email",user.email);
  return error?json({error:error.message},400):json({ok:true});
}
