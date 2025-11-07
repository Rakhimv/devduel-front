/**
 * Format date for chat date dividers
 * @param date - Date to format
 * @returns Formatted date string like "13 ноября"
 */
export const formatMessageDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const diffTime = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Вчера';
  } else if (diffDays < 7) {
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return days[d.getDay()];
  } else {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
};

/**
 * Check if two dates are on different days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if dates are on different days
 */
export const isDifferentDay = (date1: string | Date, date2: string | Date): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const date1Str = `${d1.getFullYear()}-${d1.getMonth()}-${d1.getDate()}`;
  const date2Str = `${d2.getFullYear()}-${d2.getMonth()}-${d2.getDate()}`;
  
  return date1Str !== date2Str;
};

