use strict;
use warnings;
use Path::Class;

my $test_root_d = file(__FILE__)->dir->parent->parent->subdir('t');
my $t_files_d = $test_root_d->subdir('tap-perl');
$t_files_d->mkpath;

sub generate_t ($$) {
    my ($cat, $src_file_name) = @_;
    $src_file_name =~ m{([^/]+)\.t\.html$};
    my $short_name = $1;

    my $t_f = $t_files_d->file("$cat-$short_name.t");
    print { $t_f->openw } qq{
        use strict;
        use warnings;
        use Path::Class;
        require(file(__FILE__)->dir->parent->parent->subdir('t_deps', 'lib')->file('taptest.pl')->stringify);
        extract_tap_result(file(__FILE__)->dir->parent->file('$cat', 'jsan', '$short_name.t.html'));
    };
}

for (glob "$test_root_d/ten/jsan/*.t.html") {
    generate_t 'ten', $_;
}

for (glob "$test_root_d/hatena/jsan/*.t.html") {
    generate_t 'hatena', $_;
}
