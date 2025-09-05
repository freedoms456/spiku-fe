import React, { useMemo } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  XCircle,
  Award,
  TrendingDown,
  Users,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

const PegawaiBelumSertifikasi = ({ filteredAccounts }) => {
  // Filter pegawai yang belum memiliki sertifikasi
  const pegawaiBelumSertifikasi = useMemo(() => {
    if (!filteredAccounts || filteredAccounts.length === 0) return [];
    
    return filteredAccounts.filter(account => 
      !account.account_sertifikasi || 
      account.account_sertifikasi.length === 0 ||
      account.account_sertifikasi === null
    );
  }, [filteredAccounts]);

  const totalPegawai = filteredAccounts?.length || 0;
  const jumlahBelumSertifikasi = pegawaiBelumSertifikasi.length;
  const persentaseBelumSertifikasi = totalPegawai > 0 
    ? ((jumlahBelumSertifikasi / totalPegawai) * 100).toFixed(1)
    : 0;

  return (
    <div className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-cyan-50 border border-cyan-200 rounded-lg">
      <div className="p-4 pb-3 border-b border-cyan-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <CheckCircle className="w-5 h-5 text-cyan-600" />
              Pegawai yang Belum Sertifikasi
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Daftar pegawai yang perlu mengikuti program sertifikasi
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-700">{jumlahBelumSertifikasi}</p>
            <p className="text-xs text-gray-500">dari {totalPegawai} pegawai</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Belum Sertifikasi</span>
            <span className="font-semibold text-cyan-700">{persentaseBelumSertifikasi}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${persentaseBelumSertifikasi}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {pegawaiBelumSertifikasi.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Excellent! 🎉</p>
            <p className="text-sm text-gray-500 mt-1">
              Semua pegawai sudah memiliki sertifikasi
            </p>
          </div>
        ) : (
          <>
            {/* Alert Box */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium">Perhatian</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  {jumlahBelumSertifikasi} pegawai memerlukan program sertifikasi untuk meningkatkan kompetensi
                </p>
              </div>
            </div>

            {/* List Pegawai - Scrollable */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {pegawaiBelumSertifikasi.map((account, index) => (
                <div 
                  key={account.id || index}
                  className="group p-3 bg-white border border-gray-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {account.account_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {account.account_name || 'Nama tidak tersedia'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          {account.account_nip_bpk && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              NIP: {account.account_nip_bpk}
                            </span>
                          )}
                          {account.account_unit && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {account.account_unit}
                            </span>
                          )}
                        </div>

                        {account.account_jabatan && account.account_jabatan.length > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                              {account.account_jabatan[0].name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Indicator */}
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                    </div>
                  </div>

                  {/* Contact Info on Hover */}
                  <div className="mt-2 pt-2 border-t border-gray-100 hidden group-hover:flex items-center gap-4 text-xs text-gray-600">
                    {account.account_email && (
                      <a 
                        href={`mailto:${account.account_email}`}
                        className="flex items-center gap-1 hover:text-cyan-600"
                      >
                        <Mail className="w-3 h-3" />
                        {account.account_email}
                      </a>
                    )}
                    {account.account_handphone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {account.account_handphone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 pt-4 border-t border-cyan-100 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-cyan-700">{jumlahBelumSertifikasi}</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <p className="text-xs text-gray-600">Persentase</p>
                <p className="text-lg font-bold text-amber-700">{persentaseBelumSertifikasi}%</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-600">Prioritas</p>
                <p className="text-lg font-bold text-red-700">
                  {jumlahBelumSertifikasi > 10 ? 'Tinggi' : jumlahBelumSertifikasi > 5 ? 'Sedang' : 'Rendah'}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium">
              <Award className="w-4 h-4" />
              Rencanakan Program Sertifikasi
            </button>
          </>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }
      `}</style>
    </div>
  );
};

export default  PegawaiBelumSertifikasi;