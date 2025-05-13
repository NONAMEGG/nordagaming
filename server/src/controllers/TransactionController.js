import TransactionService from "../services/TransactionService.js";

class TransactionController{
  async getUserTransactions(req, res, next){
    try{
      const user_id = req.params.user_id;
      const data = await TransactionService.getUserTransactions(user_id);
      return res.json({data});
    }catch(error){
      next(error);
    }
  }
}

export default new TransactionController;
