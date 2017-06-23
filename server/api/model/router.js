/**
 * Created by bobo on 2017/06/10 21.31
 */

const db = require('./db.js')
/**
 *  index show
 */
exports.indexShow = (req, res, next) => {
  db.query('select * from indexShowCourse', function (err, rows, fields) {
    if (err) {
      throw err
    }
    var allparentinfo = []
    var indexClass = []
    for (var i = 0; i < rows.length; i++) {
      // 两个大分类
      var classList = []
      // 四个小分类
      var classMoreList = []
      // 两个大分类
      var classImg = rows[i].showMainName.split('&')
      for (var j = 0; j < classImg.length; j++) {
         // 每次得到的对象push进数组
        classList.push({classname: classImg[j].split('@')[0], imgurl: classImg[j].split('@')[1]})
      }
      // 四个小分类 课程名称
      var classSmall = rows[i].showSmallName.split('&')
      for (var x = 0; x < classSmall.length; x++) {
        classMoreList.push({classname: classSmall[x].split('@')[0], imgurl: classSmall[x].split('@')[1]});
      }
      // 把整块 push 到数据数组
      allparentinfo.push({headinfo: {before: rows[i].showCourseMore, after: rows[i].showCourseName, imgurl:rows[i].showCourseIcon},course:{
        classList: classList,
        classMoreList: classMoreList
      }})
    }
    // 查找分类
    db.query('select * from showClass', function (err, rows, fields) {
      if (err) {
        throw err
      }
      // 循环查找数据
      for (var i = 0; i < rows.length; i++) {
        var classObj = {}
        classObj.showClassImg = rows[i].showClassImg
        classObj.showClassName = rows[i].showClassName
        classObj.classPid = rows[i].classPid
        indexClass.push(classObj)
      }
      // 专成json格式
      var data = {allparentinfo: allparentinfo, indexClass: indexClass}
      res.json(data)
    })
  })
}
/**
 * 课程列表 分类查询
 */
exports.gradeOne = (req, res, next) => {
  var promise = new Promise((resolve, reject) => {
    // 查询所有的一级
    db.query('select * from gradeOne', (err, rows, fields) => {
      if (err) {
        reject(err)
      }
      resolve(rows)
    })
  })
  promise.then((rows) => {
    let data = {}
    data.gradeOne = rows
    // 判断是否带参数
    var params = ''
    if (req.params.id) {
      params = req.params.id
    } else {
      params = rows[0].gradeId
    }
    // 查询二级
    db.query(`select * from gradeTwo where gradeTwo.pid=${params}`, (err, rows, fields) => {
      // 循环查询
      if (err) {
        throw err
      }
      data.gradeTwo = rows
      data.gradeThree = []
      function recursion (i) {
        // 循环最后一层 返回数据
        if (rows.length === i) {
          res.json(data)
          return
        }
        // 获取查询三级的参数
        let params = rows[i].gradeTwoId
        db.query(`select * from gradeThree where gradeThree.pid=${params}`, (err, rows, fields) => {
          if (err) {
            throw err
          }
          // 三级push进去
          data.gradeThree.push(rows)
          // 递归调用
          recursion(i + 1)
        })
      }
      recursion(0)
    })
  }, (error) => {
    if (error) throw error
  })
}
/**
 * 课程类表筛选
 */

exports.filter = (req, res, next) => {
  db.query('select * from filter', (err, rows, fields) => {
    if (err) {
      throw err
    }
    var data = []
    rows.forEach(function (item, index) {
      var filterTitle = item.filterTitle
      // 每次生成空数组
      var classlist = []
      // 循环查询结果
      for (var indexs in item) {
        // 判断是否有/
        if (item[indexs].toString().indexOf('/') !== -1) {
          // 以/切割
          var singleObj = item[indexs].split('/')
          // 单个对象push 组装classlist obj
          classlist.push({
            name: singleObj[0],
            id: singleObj[1]
          })
        }
      }
      // 拼装data整个大对象
      data.push({
        title: filterTitle,
        classlist: classlist
      })
    }, this)
    res.json(data)
  })
}