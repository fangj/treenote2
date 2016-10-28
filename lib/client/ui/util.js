"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var makeCancelable = exports.makeCancelable = function makeCancelable(promise) {
  var hasCanceled_ = false;

  var wrappedPromise = new Promise(function (resolve, reject) {
    promise.then(function (val) {
      return hasCanceled_ ? reject({ isCanceled: true }) : resolve(val);
    });
    promise.catch(function (error) {
      return hasCanceled_ ? reject({ isCanceled: true }) : reject(error);
    });
  });

  return {
    promise: wrappedPromise,
    cancel: function cancel() {
      hasCanceled_ = true;
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFPLElBQU0sMENBQWlCLFNBQWpCLGNBQWlCLENBQUMsT0FBRCxFQUFhO0FBQ3pDLE1BQUksZUFBZSxLQUFuQjs7QUFFQSxNQUFNLGlCQUFpQixJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RELFlBQVEsSUFBUixDQUFhLFVBQUMsR0FBRDtBQUFBLGFBQ1gsZUFBZSxPQUFPLEVBQUMsWUFBWSxJQUFiLEVBQVAsQ0FBZixHQUE0QyxRQUFRLEdBQVIsQ0FEakM7QUFBQSxLQUFiO0FBR0EsWUFBUSxLQUFSLENBQWMsVUFBQyxLQUFEO0FBQUEsYUFDWixlQUFlLE9BQU8sRUFBQyxZQUFZLElBQWIsRUFBUCxDQUFmLEdBQTRDLE9BQU8sS0FBUCxDQURoQztBQUFBLEtBQWQ7QUFHRCxHQVBzQixDQUF2Qjs7QUFTQSxTQUFPO0FBQ0wsYUFBUyxjQURKO0FBRUwsVUFGSyxvQkFFSTtBQUNQLHFCQUFlLElBQWY7QUFDRDtBQUpJLEdBQVA7QUFNRCxDQWxCTSIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IG1ha2VDYW5jZWxhYmxlID0gKHByb21pc2UpID0+IHtcclxuICBsZXQgaGFzQ2FuY2VsZWRfID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0IHdyYXBwZWRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgcHJvbWlzZS50aGVuKCh2YWwpID0+XHJcbiAgICAgIGhhc0NhbmNlbGVkXyA/IHJlamVjdCh7aXNDYW5jZWxlZDogdHJ1ZX0pIDogcmVzb2x2ZSh2YWwpXHJcbiAgICApO1xyXG4gICAgcHJvbWlzZS5jYXRjaCgoZXJyb3IpID0+XHJcbiAgICAgIGhhc0NhbmNlbGVkXyA/IHJlamVjdCh7aXNDYW5jZWxlZDogdHJ1ZX0pIDogcmVqZWN0KGVycm9yKVxyXG4gICAgKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHByb21pc2U6IHdyYXBwZWRQcm9taXNlLFxyXG4gICAgY2FuY2VsKCkge1xyXG4gICAgICBoYXNDYW5jZWxlZF8gPSB0cnVlO1xyXG4gICAgfSxcclxuICB9O1xyXG59O1xyXG4iXX0=