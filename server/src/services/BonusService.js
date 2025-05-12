import { InternalServerError, ServerError } from "../errors/customError.js";
import { supabase } from "../utils/supabase.js"  
class BonusService{
  async validateSpin(user_id, intervalHours = 0.016667){
    const data = await this.getBonus(user_id);
    const lastUpdate = new Date(data.updated_at);
    const now = new Date();
    const diffHours = (now - lastUpdate) / (1000 * 60 * 60); 
    return diffHours >= intervalHours; 
  }

  async addBonus(user_id, bonus){
    const newDate = new Date()
    newDate.setHours(newDate.getHours()+3);
    const old_bonus = await this.getBonus(user_id);
    const {data, error} = await supabase
      .from('bonus')
      .update({bonus: old_bonus.bonus + parseInt(bonus), updated_at: newDate.toISOString()})
      .eq('user_id', user_id)
      .select("bonus");
    
    if(error){
      throw new InternalServerError('Ошибка при добавлении бонуса в базу') 
    };

    return data[0].bonus;
  }

  async getBonus(user_id){
    const {data, error} = await supabase
      .from('bonus')
      .select('bonus, updated_at')
      .eq('user_id', user_id);

    if(error){
      console.log(error);
      throw new InternalServerError('Ошибка при получении бонуса из базы данных') 
    }

    return {
      bonus: data[0].bonus,
      updated_at: data[0].updated_at 
    }
  }
}

export default new BonusService();
