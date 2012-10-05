use strict;
use warnings;
use Path::Class;
use lib file(__FILE__)->dir->resolve->parent->subdir('modules', 'Wight', 'lib')->stringify;
use Wight;
use AnyEvent::Util;
use Data::Dumper;
use Test::More;

my $httpserver_pid;
my $http_port;
my $base_dir = file(__FILE__)->dir->parent->parent->subdir('t');

sub start_http_server () {
    run_cmd(
        [
            'perl',
            file(__FILE__)->dir->parent->subdir('modules', 'perl-anyevent-httpserver', 'bin')->file('staticpageserver.pl'),
            $base_dir,
            $http_port = int(1024 + rand 6000),
        ],
        '$$' => \$httpserver_pid,
    ) unless $httpserver_pid;
}

sub stop_http_server () {
    kill 'TERM', $httpserver_pid;
}

sub extract_tap_result ($) {
    my $file_name = shift;

    my $use_server = $file_name =~ /XHR/;

    my $test_url = 'file:///' . file($file_name)->absolute;
    if ($use_server) {
        start_http_server;
        $test_url = 'http://localhost:' . $http_port . '/' . file($file_name)->absolute->relative($base_dir);
    }
    
    my $wight = Wight->new;
    $wight->phantomjs($ENV{TEST_PHANTOMJS} || 'phantomjs');
    $wight->handshake;
    
    eval {
        $wight->visit($test_url);
        1;
    } or do {
        warn Dumper $@;
        BAIL_OUT($test_url . ': Page error');
    };

    my $wait = $wight->evaluate(q{document.documentElement.getAttribute('data-test-wait')});
    sleep $wait if $wait;

    sleep 3 if $file_name =~ /JSONP/;

    my $tap;
    eval {
        $wight->execute(q{
            var v = document.getElementById('test');
            var list = v.querySelectorAll('script, style');
            for (var i = list.length - 1; i >= 0; i--) {
                list[i].parentNode.removeChild(list[i]);
            }
        });
        $tap = $wight->evaluate(q{document.getElementById('test').textContent});
        print $tap;
    };

    if ($use_server) {
        stop_http_server;
    }

    if ($@) {
        print "Bail out!  Evaluation error!\n";
        print Dumper $@;
        return 0;
    }

    return 1 if $tap =~ /^not ok/m; # error
    return 0; # success or error, unknown!
}

1;
