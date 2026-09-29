import { createClient } from "@supabase/supabase-js";
export function browserClient(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
export function requestClient(token:string){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
}
export async function authorized(request:Request){
  const token=request.headers.get("Authorization")?.replace(/^Bearer /,"")||"";
  if(!token)return null;
  const client=requestClient(token);
  const {data:{user},error}=await client.auth.getUser(token);
  if(error||!user?.email)return null;
  const {data:member}=await client.from("sd_members").select("email,role").eq("email",user.email.toLowerCase()).maybeSingle();
  return member?{client,email:member.email,role:member.role}:null;
}
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
