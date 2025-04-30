import { validationResult } from "express-validator";
import AuthService from "../services/AuthService.js";

class UserController{
  async registration(req, res){
    try{
      const {name, email, password} = req.body;
      const file = req.file;
      const errors = validationResult(req);
      console.log(req.body)
      if(!errors.isEmpty()){
        console.log(errors.array(), name, email, password, file)
        throw Error('Ошибка при валидации') 
      }
      const user = await AuthService.registration(name, email, password, file);
      console.log('Пользователь успешно зарегестрировался') 
      res.json(user);
    }catch(error){  
      console.log('Ошибка при регистрации', error);
      res.json({message: error.message})
    }
  }

  async login(req, res){
    try{
      const {email, password} = req.body;
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors.array(), email, password)
        throw Error('Ошибка при валидации') 
      }
      const user = await AuthService.login(email, password);
      console.log('Пользователь успешно вошел'); 
      res.json(user);
    } catch(error){
      console.log('Ошибка при входе', error);
      res.json({message: error.message})
    }
  }

  async update(req, res){
    try{
      console.log(req.body)
      const {name, email, password} = req.body;
      const file = req.file;
      const user = await AuthService.update(name, email, password, file);
      console.log('Данные успешно обновлены') 
      res.json(user);
    }catch(error){
      console.log('Ошибка при обновлении', error);
      res.json({message: error.message})
    }
  }
}

export default new UserController();
