

export default function(){
  const {
    qs
  }=window.UTILS;
  return  qs.parse(window.location.href.split('?')[1]||'')
}