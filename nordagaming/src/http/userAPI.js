import { host } from "./index.js";

export const registration = async (name, email, password, avatar) => {
  const formData = new FormData();

  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  if(avatar){
    formData.append('avatar', avatar);
    console.log(avatar)
  }

  const response = await host.post('/api/user/registr', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response;
}

export const login = async (email, password) => {
  const response = await host.post('/api/user/login', {email, password});
  return response;
}

export const update = async (id, name, email, password, avatar) =>{
  const formData = new FormData();

  formData.append('id', id)
  if(name){
    formData.append('name', name);
  }
  if(email){
    formData.append('email', email);
  }
  if(password){
    formData.append('password', password);
  }
  if(avatar){
    formData.append('avatar', avatar);
    console.log(avatar)
  }

  formData.forEach((val, key) => {
    console.log(`${key}:`, val);
  });

  const response = await host.put('/api/user/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response;

}
