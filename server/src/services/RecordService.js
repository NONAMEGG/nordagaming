import { supabase } from "../utils/supabase.js"
import TransactionService from "./TransactionService.js";
import UserService from "./UserService.js";

class RecordService{
  async getRecord(user_id){
    const {data, error} = await supabase
      .from('records')
      .select('total_score')
      .eq('user_id', user_id)

    if(error){
      console.log(error.message)
      throw Error('Ошибка при получении рекорда');
    }

    return data;
  }

  async getRecords(offset, limit){
    const { data, error } = await supabase
      .from('records')
      .select(`
        id,
        total_score,
        users (
          name
        )
      `)
      .order('total_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log(error);
      throw Error('Ошибка при получении пользователей');
    }

    return data; 
  }

  async addRecord(user_id, new_score){
    const old_record = await this.getRecord(user_id);
    const new_record = parseInt(old_record[0].total_score) + parseInt(new_score);
    
    const { error: updateError } = await supabase
      .from('records')
      .update({ total_score: new_record, updated_at: new Date() })
      .eq('user_id', user_id);
    
    if (updateError){
      console.log(updateError.message)
      throw new Error('Ошибка при обновлении счёта');
    } 
    
    await TransactionService.createTransaction(user_id, 'score', new_score);

    return {new_record}
  }

  async getTopRecords(){
    const { data, error } = await supabase
      .from('records')
      .select(`
        id,
        total_score,
        users (
          name
        )
      `)
      .order('total_score', { ascending: false })
      .limit(10)

    if (error) {
      console.log(error);
      throw Error('Ошибка при получении пользователей');
    }
    return data; 
  }
 
}

export default new RecordService()
