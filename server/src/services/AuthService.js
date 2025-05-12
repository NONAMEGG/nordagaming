import bcrypt from 'bcryptjs'
import { supabase } from '../utils/supabase.js';
import fs from 'fs'
import { InternalServerError, ServerError } from '../errors/customError.js';

class AuthService{
  async registration(name, email, password, avatar){
    const {data: person_data, error: person_error} = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    console.log(person_data);
    if(person_data && person_data.length > 0){
      throw new ServerError('Пользователь с таким email уже существует');
    }
    console.log('Аватарка', avatar);
    let avatar_url = null;
    if(avatar){
      const filename = `avatar_${name}_${Date.now()}.${
        avatar.originalname.split('.').pop()
      }`

      const fileBuffer = fs.readFileSync(avatar.path)
        
      console.log(filename)

      const { data: storageData, error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filename, fileBuffer, {
          contentType: avatar.mimetype,
      });

      if (storageError) {
        fs.unlinkSync(avatar.path);         
        throw new InternalServerError('Ошибка загрузки аватара: ' + storageError.message);
      }

      const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);

      avatar_url = urlData.publicUrl;
      
      console.log(storageData)
      
      fs.unlinkSync(avatar.path);
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const {data, error} = await supabase.from('users').insert({
      name: name,
      email: email,
      password: hashedpassword,
      avatar_url: avatar_url,
    }).select('*')
    if(error){
      throw new InternalServerError('Ошибка при добавлении пользователя в базу: ', error)
    }
    const {error: errorRecords} = await supabase
      .from('records')
      .insert({user_id: data[0].id})

    if(errorRecords){
      throw new InternalServerError('Ошибка при добавлении записи в рекорды при создании пользоваетля');
    }

    const {error: errorBonus} = await supabase
      .from('bonus')
      .insert({user_id: data[0].id})

    if(errorBonus){
      throw new InternalServerError('Ошибка при добавлении записи в бонусы при создании пользователя')
    }

    return {
      id: data[0].id,
      name: data[0].name, 
      email: data[0].email,
      avatar_url: avatar_url,
      total_score: 0
    };
  }

  async login(email, password){
    const {data, error} = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    if(!data || data.length === 0){
      throw new ServerError('Пользователь с таким email не существует');
    }
    const verificy = await bcrypt.compare(password, data[0].password);
    if(!verificy){
      throw new ServerError('Неверный пароль');
    }
    const {data: dataScore, error: errorScore} = await supabase
      .from('records')
      .select('total_score')
      .eq('user_id', data[0].id)
    if(errorScore){ 
      console.log(errorScore.message);
      throw new InternalServerError('Ошибка при получении очков пользователя');
    }
    return {
      id: data[0].id,
      name: data[0].name, 
      email: data[0].email,
      avatar_url: data[0].avatar_url,
      total_score: dataScore[0].total_score
    }
  }

  async update(id, name, email, password, avatar){
    let newData = {};

    if(email){
      const {data: person_data, error: person_error} = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      console.log(person_data);
      if(person_data && person_data.length > 0){
        throw new ServerError('Пользователь с таким email уже существует');
      }
      else{
        const {data, error} = await supabase
          .from('users')
          .update({email: email})
          .eq('id', id)
        if(error){
          throw new InternalServerError('Ошибка при обновлении почты пользователя');
        }
        newData['email'] = email;
      }
    }
    if(avatar){
      let avatar_url = null;

      const filename = `avatar_${name}_${Date.now()}.${
        avatar.originalname.split('.').pop()
      }`

      const fileBuffer = fs.readFileSync(avatar.path)
        
      console.log(filename)

      const { data: storageData, error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filename, fileBuffer, {
          contentType: avatar.mimetype,
      });

      if (storageError) {
        fs.unlinkSync(avatar.path);         
        throw new InternalServerError('Ошибка загрузки аватара: ' + storageError.message);
      }

      const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);

      avatar_url = urlData.publicUrl;
      
      console.log(storageData)
      
      fs.unlinkSync(avatar.path);

      const {data, error} = await supabase
        .from('users')
        .update({avatar_url: avatar_url})
        .eq('id', id)
      if(error){
        throw new InternalServerError('Ошибка при обновлении почты пользователя');
      }
      newData['avatar_url'] = avatar_url;
    }
    
    if(password){
      const hashedpassword = await bcrypt.hash(password, 10);
      const {data, error} = await supabase.from('users').update({
        password: hashedpassword
      })
      .eq('id', id)
      if(error){
        throw new InternalServerError('Ошибка при добавлении пользователя в базу: ', error)
      }
      newData['password'] = hashedpassword;
    }

    if(name){
      const {data, error} = await supabase.from('users').update({
        name: name
      })
      .eq('id', id)
      if(error){
        throw new InternalServerError('Ошибка при обновлении пользователя в базе: ', error.message)
      }
      newData['name'] = name;
    }

    return {
      ...newData      
    };
  }

}

export default new AuthService();
