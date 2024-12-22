export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
  }
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options); 
};

export const formatDateFromSelectDate = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "Invalid Date";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
