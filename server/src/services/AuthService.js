import bcrypt from 'bcryptjs'
import { supabase } from '../utils/supabase.js';

class AuthService{
  async registration(name, email, password){
    const {data: person_data, error: person_error} = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    console.log(person_data);
    if(person_data && person_data.length > 0){
      throw Error('Пользователь с таким email уже существует');
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const {data, error} = await supabase.from('users').insert({
      name: name,
      email: email,
      password: hashedpassword,
    }).select('*')
    if(error){
      throw Error('Ошибка при добавлении пользователя в базу: ', error)
    }
    const {error: errorRecords} = await supabase
      .from('records')
      .insert({user_id: data[0].id})

    if(errorRecords){
      throw Error('Ошибка при добавлении записи в рекорды');
    }

    return {
      id: data[0].id,
      name: data[0].name, 
      email: data[0].email,
      avatar_url: data[0].avatar_url
    };
  }

  async login(email, password){
    const {data, error} = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    if(!data || data.length === 0){
      throw Error('Пользователь с таким email не существует');
    }
    const verificy = await bcrypt.compare(password, data[0].password);
    if(!verificy){
      throw Error('Неверный пароль');
    }
    return {
      id: data[0].id,
      name: data[0].name, 
      email: data[0].email,
      avatar_url: data[0].avatar_url
    }
  }
}

export default new AuthService();
