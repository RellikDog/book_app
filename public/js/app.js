'use strict';

// $(document).ready(function() {
//   console.log('toggle boi');
//   $('button').click((e) => {
//     let idClicked = '.' + e.target.id;
//     // console.log(idClicked + ' toggle on')
//     $(idClicked).toggle();
//     $('a[id="close"]').click(() => {
//       // console.log(idClicked + ' toggle off')
//       $(idClicked).hide();
//     });
//   });
// });
$('.show-form').on('click', function(){
  $(this).next().removeClass('hide-form');
});
