import createBonusTable from "./BonusModel.js";
import createRecordTable from "./RecordModel.js";
import createTransactionTable from "./TransactionModel.js"
import createUserTable from "./UserModel.js"

export default async function CreateTables(supabase){
  await createUserTable(supabase);
  await createTransactionTable(supabase);
  await createRecordTable(supabase);
  await createBonusTable(supabase); 
}
