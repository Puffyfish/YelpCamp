module.exports = func => {
  return (req, res, next) => { //returns a function that accepts a function
    func(req, res, next).catch(next); // execute the accepted function while catching any errors, then pass it to NEXT
  }
}
