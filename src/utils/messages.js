function createMessage(type, content) {
  return { message: { type, content } };
}

function errorMsg(content) {
  return createMessage('danger', content);
}

function infoMsg(content) {
  return createMessage('info', content);
}

function successMsg(content) {
  return createMessage('success', content);
}

module.exports = { errorMsg, infoMsg, successMsg };
