import {authorized,json} from "../../../lib/supabase";
export async function GET(request:Request){
  const user=await authorized(request);if(!user)return json({error:"Sign in with your invited email"},401);
  const {client,email}=user;
  const [watch,filings,reads,feed,members,deliveries]=await Promise.all([
    client.from("sd_watchlist").select("symbol,name,added_at").order("added_at",{ascending:false}),
    client.from("sd_filings").select("id,symbol,category,title,description,url,published_at,seen_at,analysis,document_read").order("published_at",{ascending:false}).limit(150),
    client.from("sd_reads").select("filing_id,read_at").eq("email",email),
    client.from("sd_feed_state").select("last_checked_at,status").eq("id",1).single(),
    client.from("sd_members").select("email,role,telegram_chat_id,email_alerts,telegram_alerts"),
    client.from("sd_deliveries").select("filing_id,channel,status,attempted_at,error").eq("email",email).order("attempted_at",{ascending:false}).limit(30)
  ]);
  const failure=[watch,filings,reads,feed,members,deliveries].find(x=>x.error);
  if(failure?.error)return json({error:failure.error.message},503);
  const byId=new Map((reads.data||[]).map(x=>[x.filing_id,x.read_at]));
  return json({watchlist:watch.data,filings:(filings.data||[]).map(f=>({...f,analysis:f.analysis?JSON.stringify(f.analysis):null,document_read:f.document_read?1:0,read_at:byId.get(f.id)||null})),feed:feed.data,members:members.data,deliveries:deliveries.data,account:email});
}
