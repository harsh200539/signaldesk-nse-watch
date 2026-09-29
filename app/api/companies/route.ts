import {authorized,json} from "../../../lib/supabase";
import {companies} from "../../../lib/market";
export async function GET(request:Request){
  if(!await authorized(request))return json({error:"Sign in required"},401);
  const q=(new URL(request.url).searchParams.get("q")||"").trim().toLowerCase();if(q.length<2)return json({results:[]});
  try{return json({results:(await companies()).filter(([s,n])=>s.toLowerCase().includes(q)||n.toLowerCase().includes(q)).slice(0,12)})}
  catch{return json({error:"NSE company catalog unavailable"},503)}
}
