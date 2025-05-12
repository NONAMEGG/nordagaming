import { InternalServerError } from "../errors/customError.js";
import { supabase } from "../utils/supabase.js"
import BonusService from "./BonusService.js";
import TransactionService from "./TransactionService.js";

class RecordService{
  async getRecord(user_id){
    const {data, error} = await supabase
      .from('records')
      .select('total_score')
      .eq('user_id', user_id)

    if(error){
      console.log(error.message)
      throw new InternalServerError('Ошибка при получении рекорда');
    }

    return data;
  }

  async getRecords(offset, limit){
    const { data, error } = await supabase
      .from('records')
      .select(`
        id,
        user_id,
        total_score,
        users (
          name,
          avatar_url
        )
      `)
      .order('total_score', { ascending: false })
      .range(offset, offset + limit - 1);
    
    for (let item of data){
      console.log('go')
      const newValue = await BonusService.getBonus(item.user_id);
      console.log(newValue);
      item.total_score += newValue.bonus;
    }

    if (error) {
      console.log(error);
      throw new InternalServerError('Ошибка при получении пользователей');
    }

    return data; 
  }

  async addRecord(user_id, new_score){
    let old_record = await this.getRecord(user_id);
    old_record = old_record[0].total_score;
    console.log(old_record);
    if(parseInt(new_score) > old_record){
      const new_record = parseInt(new_score);
      const { error: updateError } = await supabase
      .from('records')
      .update({ total_score: new_record, updated_at: new Date() })
      .eq('user_id', user_id);
 
      if (updateError){
        console.log(updateError.message)
        throw new InternalServerError('Ошибка при обновлении счёта');
      } 
    
      await TransactionService.createTransaction(user_id, 'score', new_score);

      return new_record;
    }else{
      return old_record;
    } 
  }
}

export default new RecordService()
