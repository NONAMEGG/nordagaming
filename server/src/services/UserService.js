import { supabase } from "../utils/supabase.js";

class UserService{

  async getUserById(user_id){
    const {data: user, error} = supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();
    
    if(error){
      console.log(error.message);
      throw Error('Ошибка при получении пользователя');
    }

    return {
      name: user[0].name,
      email: user[0].email,
      avatar_url: user[0].avatar_url
    }
  }

}

export default new UserService();
