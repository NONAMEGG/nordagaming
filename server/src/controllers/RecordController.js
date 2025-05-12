import RecordService from "../services/RecordService.js";

class RecordController{
  async getRecord(req, res, next){
    try{
      const { user_id } = req.params;
      const record = await RecordService.getRecord(user_id);
      res.json({record: record});
    } catch(error){
      console.log('Ошибка при получении счёта пользователя')
      next(error);
    }
  }

  async getRecords(req, res, next){
    try{
      let {limit, page} = req.query;
      limit = parseInt(limit) || 1;
      page = parseInt(page) || 1;
      let offset = page * limit - limit
      const users = await RecordService.getRecords(offset, limit);
      res.json({records: users})
    } catch(error){
      console.log('Ошибка при получении счёта пользователей')
      next(error)
    }
  }
  
  async addRecord(req, res, next){
    try{
      const total_score = req.body.total_score;
      const user_id = req.params.user_id;
      const new_score = await RecordService.addRecord(user_id, total_score);
      console.log('Счет пользователя был обновлен');
      res.json({new_score: new_score}); 
    } catch(error){
      console.log('Ошибка при обновлении рекорда пользователя')
      next(error)
    }
  }
}

export default new RecordController();
