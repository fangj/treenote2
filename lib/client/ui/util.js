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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQvdWkvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFPLElBQU0sMENBQWlCLFNBQWpCLGNBQWlCLENBQUMsT0FBRCxFQUFhO0FBQ3pDLE1BQUksZUFBZSxLQUFmLENBRHFDOztBQUd6QyxNQUFNLGlCQUFpQixJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RELFlBQVEsSUFBUixDQUFhLFVBQUMsR0FBRDthQUNYLGVBQWUsT0FBTyxFQUFDLFlBQVksSUFBWixFQUFSLENBQWYsR0FBNEMsUUFBUSxHQUFSLENBQTVDO0tBRFcsQ0FBYixDQURzRDtBQUl0RCxZQUFRLEtBQVIsQ0FBYyxVQUFDLEtBQUQ7YUFDWixlQUFlLE9BQU8sRUFBQyxZQUFZLElBQVosRUFBUixDQUFmLEdBQTRDLE9BQU8sS0FBUCxDQUE1QztLQURZLENBQWQsQ0FKc0Q7R0FBckIsQ0FBN0IsQ0FIbUM7O0FBWXpDLFNBQU87QUFDTCxhQUFTLGNBQVQ7QUFDQSw4QkFBUztBQUNQLHFCQUFlLElBQWYsQ0FETztLQUZKO0dBQVAsQ0FaeUM7Q0FBYiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IG1ha2VDYW5jZWxhYmxlID0gKHByb21pc2UpID0+IHtcbiAgbGV0IGhhc0NhbmNlbGVkXyA9IGZhbHNlO1xuXG4gIGNvbnN0IHdyYXBwZWRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHByb21pc2UudGhlbigodmFsKSA9PlxuICAgICAgaGFzQ2FuY2VsZWRfID8gcmVqZWN0KHtpc0NhbmNlbGVkOiB0cnVlfSkgOiByZXNvbHZlKHZhbClcbiAgICApO1xuICAgIHByb21pc2UuY2F0Y2goKGVycm9yKSA9PlxuICAgICAgaGFzQ2FuY2VsZWRfID8gcmVqZWN0KHtpc0NhbmNlbGVkOiB0cnVlfSkgOiByZWplY3QoZXJyb3IpXG4gICAgKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwcm9taXNlOiB3cmFwcGVkUHJvbWlzZSxcbiAgICBjYW5jZWwoKSB7XG4gICAgICBoYXNDYW5jZWxlZF8gPSB0cnVlO1xuICAgIH0sXG4gIH07XG59O1xuIl19