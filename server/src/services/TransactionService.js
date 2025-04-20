import { supabase } from "../utils/supabase.js";


class TransactionService{
  async createTransaction(user_id, type, value){
    const { data, error} = await supabase
    .from('transactions')
    .insert({
      user_id: user_id,
      type: type,
      amount: value,
      created_at: new Date()
    }).select();

    if (error) {
      console.error('Транзакция не была записана: ', error);
      throw new Error('Ошибка при добавлении транзакции');
    }
    
    return data;
  }
}

export default new TransactionService();
