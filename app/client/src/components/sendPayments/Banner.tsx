import React from 'react';

function Banner({ bannerText, isSuccess }: { bannerText: string, isSuccess: boolean }) {
  return (
    <div className={`flex flex-row gap-2 border ${isSuccess ? 'border-green-300 bg-green-200 text-green-800' : 'border-red-300 bg-red-200 text-red-800'} rounded p-3 mb-3`}>
      <span className="material-icons-outlined text-md ">{isSuccess ? 'check' : 'info'}</span>

      <p className="text-xl ">{bannerText}</p>
    </div>
  );
}
export default Banner;
