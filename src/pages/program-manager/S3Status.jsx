import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, Cloud, HardDrive } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import uploadAPI from '../../api/upload';
import toast from 'react-hot-toast';

const S3Status = () => {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await uploadAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Failed to check S3 status');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const response = await uploadAPI.testConnection();
      if (response.success) {
        setTestResult({
          success: true,
          message: response.message,
          data: response.data,
        });
        toast.success('S3 connection test passed!');
      } else {
        setTestResult({
          success: false,
          message: response.error || response.message || 'Test failed',
          details: response.details,
        });
        toast.error('S3 connection test failed');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Test failed',
      });
      toast.error('S3 connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!status) return null;
    if (status.s3Configured && status.s3ConnectionTest === 'SUCCESS') {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    } else if (status.s3Configured && status.s3ConnectionTest === 'FAILED') {
      return <XCircle className="h-6 w-6 text-red-500" />;
    } else if (status.s3Configured) {
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    } else {
      return <HardDrive className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="S3 Storage Status"
        description="Check AWS S3 configuration and connectivity"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={checkStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {status?.s3Configured && (
              <Button variant="secondary" onClick={testConnection} disabled={testing}>
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Status Card */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center gap-4 mb-6">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-text">
                Storage Type: {status?.storageType || 'Unknown'}
              </h2>
              <p className="text-sm text-textMuted">
                {status?.s3Configured
                  ? 'AWS S3 is configured'
                  : 'Using local file storage'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-text">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-textMuted">Access Key ID:</span>
                  <span className={status?.hasAccessKey ? 'text-green-600' : 'text-red-600'}>
                    {status?.hasAccessKey ? '✓ Set' : '✗ Not Set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-textMuted">Secret Access Key:</span>
                  <span className={status?.hasSecretKey ? 'text-green-600' : 'text-red-600'}>
                    {status?.hasSecretKey ? '✓ Set' : '✗ Not Set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-textMuted">Bucket Name:</span>
                  <span className={status?.hasBucketName ? 'text-green-600' : 'text-red-600'}>
                    {status?.hasBucketName ? status.bucketName : '✗ Not Set'}
                  </span>
                </div>
                {status?.bucketName && (
                  <div className="flex items-center justify-between">
                    <span className="text-textMuted">Region:</span>
                    <span className="text-text">{status.region || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-text">Connection Status</h3>
              <div className="space-y-2 text-sm">
                {status?.s3Configured ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-textMuted">S3 Client:</span>
                      <span className="text-green-600">✓ Initialized</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textMuted">Connection Test:</span>
                      <span
                        className={
                          status.s3ConnectionTest === 'SUCCESS'
                            ? 'text-green-600'
                            : status.s3ConnectionTest === 'FAILED'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }
                      >
                        {status.s3ConnectionTest === 'SUCCESS'
                          ? '✓ Success'
                          : status.s3ConnectionTest === 'FAILED'
                          ? '✗ Failed'
                          : '⚠ Not Tested'}
                      </span>
                    </div>
                    {status.s3Error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        Error: {status.s3Error}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-textMuted">CloudFront:</span>
                      <span className={status.cloudfrontEnabled ? 'text-green-600' : 'text-gray-500'}>
                        {status.cloudfrontEnabled ? '✓ Enabled' : '✗ Not Configured'}
                      </span>
                    </div>
                    {status.cloudfrontUrl && (
                      <div className="text-xs text-textMuted truncate" title={status.cloudfrontUrl}>
                        {status.cloudfrontUrl}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-textMuted">
                    <p className="mb-2 font-semibold text-red-600">S3 is not configured. Files will be stored locally.</p>
                    {status?.missingVars && status.missingVars.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold mb-1">Missing environment variables:</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {status.missingVars.map((varName) => (
                            <li key={varName} className="text-red-600">{varName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="font-semibold mb-1">To enable S3:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Add these to your backend <code>.env</code> file:</li>
                        <li className="ml-4 font-mono text-xs">
                          AWS_ACCESS_KEY_ID=your-key<br/>
                          AWS_SECRET_ACCESS_KEY=your-secret<br/>
                          AWS_S3_BUCKET_NAME=your-bucket<br/>
                          AWS_REGION=us-east-1
                        </li>
                        <li><strong>Restart your backend server</strong> (important!)</li>
                        <li>Refresh this page to verify</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`rounded-2xl border p-6 ${
              testResult.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {testResult.success ? 'Test Passed' : 'Test Failed'}
                </h3>
                <p
                  className={`text-sm mb-3 ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {testResult.message}
                </p>
                {testResult.data && (
                  <div className="text-xs text-green-700 bg-white/50 p-3 rounded border border-green-200">
                    <div className="font-semibold mb-2">Test Details:</div>
                    <div className="space-y-1">
                      <div>Bucket: {testResult.data.bucketName}</div>
                      <div>Region: {testResult.data.region}</div>
                      <div>Operations: {testResult.data.operations.join(', ')}</div>
                    </div>
                  </div>
                )}
                {testResult.details && (
                  <div className="text-xs text-red-700 bg-white/50 p-3 rounded border border-red-200">
                    <div className="font-semibold mb-2">Error Details:</div>
                    <div className="space-y-1">
                      <div>Bucket: {testResult.details.bucketName}</div>
                      <div>Region: {testResult.details.region}</div>
                      <div className="mt-2">{testResult.details.suggestion}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!status?.s3Configured && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">S3 Not Configured</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  To enable AWS S3 storage, add these environment variables to your backend .env file:
                </p>
                <div className="bg-white/50 p-4 rounded border border-yellow-200 font-mono text-xs">
                  <div>AWS_ACCESS_KEY_ID=your-access-key-id</div>
                  <div>AWS_SECRET_ACCESS_KEY=your-secret-access-key</div>
                  <div>AWS_S3_BUCKET_NAME=your-bucket-name</div>
                  <div>AWS_REGION=us-east-1</div>
                  <div className="mt-2 text-yellow-600"># Optional: CloudFront CDN</div>
                  <div>AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net</div>
                </div>
                <p className="text-xs text-yellow-700 mt-3">
                  See <code>S3_SETUP.md</code> in the backend directory for detailed setup instructions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default S3Status;

