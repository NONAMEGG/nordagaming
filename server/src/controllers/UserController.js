import { validationResult } from "express-validator";
import AuthService from "../services/AuthService.js";

class UserController{
  async registration(req, res, next){
    try{
      const {name, email, password} = req.body;
      const file = req.file;
      const errors = validationResult(req);
      console.log(req.body)
      if(!errors.isEmpty()){
        console.log(errors.array(), name, email, password, file)
        const error = new Error('Validation failed');
        error.validationErrors = errors.array();
        error.statusCode = 422;
        throw error;
      }
      const user = await AuthService.registration(name, email, password, file);
      console.log('Пользователь успешно зарегестрировался') 
      res.json(user);
    }catch(error){  
      console.log('Ошибка при регистрации', error);
      next(error)
    }
  }

  async login(req, res, next){
    try{
      const {email, password} = req.body;
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors.array(), email, password)
        const error = new Error('Validation failed');
        error.validationErrors = errors.array();
        error.statusCode = 422;
        throw error;
      }
      const user = await AuthService.login(email, password);
      console.log('Пользователь успешно вошел'); 
      res.json(user);
    } catch(error){
      console.log('Ошибка при входе', error);
      next(error)
    }
  }

  async update(req, res, next){
    try{
      console.log(req.body)
      const {id, name, email, password} = req.body;
      const file = req.file;
      const user = await AuthService.update(id, name, email, password, file);
      console.log('Данные успешно обновлены', user) 
      res.json(user);
    }catch(error){
      console.log('Ошибка при обновлении', error);
      next(error)
    }
  }
}

export default new UserController();
