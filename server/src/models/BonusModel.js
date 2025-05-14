export default async function createBonusTable(supabase) {

  const { data, error } = await supabase.rpc('create_bonus_table');

  if (error) {
    console.error('Ошибка при создании таблицы с бонусами:', error);
    throw Error();
  } else {
    console.log('Таблица с бонусами успешно создана или уже существует: ', data);
  }
}
