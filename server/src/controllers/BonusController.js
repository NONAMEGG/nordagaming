import BonusService from "../services/BonusService.js";

class BonusController{ 
  async bonusValidate(req, res, next){
    try{
      const user_id = req.query.user_id;
      const data = await BonusService.validateSpin(user_id);

      res.json({message: data ? "Вращение" : "Нет вращения", data: data});
    }catch(error){
      console.log('Ошибка при проверке на вращение бонуса')
      next(error)
    }
  }
  async bonusAdd(req, res, next){
    try{
      const {user_id, bonus} = req.body;
      const data = await BonusService.addBonus(user_id, bonus);
      res.json(data);
    }catch(error){
      console.log('Ошибка при обновлении бонуса')
      next(error)
    }
  }

}

export default new BonusController();
