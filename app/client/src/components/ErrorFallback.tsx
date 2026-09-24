import React from 'react';

function ErrorFallback() {
  return (
    <div className="text-center pt-24" data-cy="errorMessage">
      Error loading Unicorn Finance right now :(
    </div>
  );
}

export default ErrorFallback;
