import RecordService from "../services/RecordService.js";

class RecordController{
  async getRecord(req, res){
    try{
      const { user_id } = req.params;
      const record = await RecordService.getRecord(user_id);
      res.json({record: record});
    } catch(error){
      console.log('Ошибка при получении счёта пользователя')
      res.json({message: error.message})
    }
  }

  async getRecords(req, res){
    try{
      let {limit, page} = req.query;
      limit = parseInt(limit) || 1;
      page = parseInt(page) || 1;
      let offset = page * limit - limit
      const users = await RecordService.getRecords(offset, limit);
      res.json({records: users})
    } catch(error){
      console.log('Ошибка при получении счёта пользователей')
      res.json({message: error.message})
    }
  }
  
  async getTopRecords(req, res){
    try{
      const users = await RecordService.getTopRecords();
      res.json({records: users})
    } catch(error){
      console.log('Ошибка при получении счёта пользователей')
      res.json({message: error.message})
    }

  }

  async addRecord(req, res){
    try{
      const {user_id} = req.params;
      const {total_score} = req.body;
      const new_score = await RecordService.addRecord(user_id, total_score);
      console.log('Счет пользователя был обновлен');
      res.json({new_score: new_score}); 
    } catch(error){
      console.log('Ошибка при обновлении рекорда пользователя')
      res.json({message: error.message});
    }
  }
}

export default new RecordController();
