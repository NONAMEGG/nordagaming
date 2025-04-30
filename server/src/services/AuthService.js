import bcrypt from 'bcryptjs'
import { supabase } from '../utils/supabase.js';
import fs from 'fs'

class AuthService{
  async registration(name, email, password, avatar){
    const {data: person_data, error: person_error} = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    console.log(person_data);
    if(person_data && person_data.length > 0){
      throw Error('Пользователь с таким email уже существует');
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
        throw Error('Ошибка загрузки аватара: ' + storageError.message);
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
      avatar_url: avatar_url
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

  async update(name, email, password, avatar){
    let newData = new Map();

    if(email){
      const {data: person_data, error: person_error} = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      console.log(person_data);
      if(person_data && person_data.length > 0){
        throw Error('Пользователь с таким email уже существует');
      }
      else{
        const {data, error} = await supabase
          .from('users')
          .update({email: email})
        if(error){
          throw Error('Ошибка при обновлении почты пользователя');
        }
        newData.set('email', email)
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
        throw Error('Ошибка загрузки аватара: ' + storageError.message);
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
      if(error){
        throw Error('Ошибка при обновлении почты пользователя');
      }
      newData.set('avatar_url', avatar_url)
    }
    
    if(password){
      const hashedpassword = await bcrypt.hash(password, 10);
      const {data, error} = await supabase.from('users').update({
        password: hashedpassword
      })
      if(error){
        throw Error('Ошибка при добавлении пользователя в базу: ', error)
      }
      newData.set('password', hashedpassword)
    }

    if(name){
      const {data, error} = await supabase.from('users').update({
        name: name
      })
      if(error){
        throw Error('Ошибка при добавлении пользователя в базу: ', error)
      }
      newData.set('name', name)
    }

    return {
      ...newData      
    };
  }

}

export default new AuthService();
