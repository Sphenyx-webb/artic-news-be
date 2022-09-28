const catchAsync = (fn) => (request, response, next) => fn(request, response, next).catch(next)

export default catchAsync